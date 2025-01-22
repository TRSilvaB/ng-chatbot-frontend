import { Component, ElementRef, ViewChild, OnInit, AfterViewInit, computed } from '@angular/core';
import { ChatbotSessionService } from '../../../chatbot-services/chatbot-session/chatbot-session.service';
import { ChatSessionMessageAssistantComponent } from '../chat-messages/chat-session-message-assistant/chat-session-message-assistant.component';
import { ChatSessionMessageUserComponent } from '../chat-messages/chat-session-message-user/chat-session-message-user.component';
import { ChatbotEventService } from '../../../chatbot-services/chatbot-events/chatbot-event.service';
import { AppState } from '../../../../../core/app-state';

@Component({
  selector: 'app-chat-session-history',
  standalone: true,
  imports: [ChatSessionMessageAssistantComponent, ChatSessionMessageUserComponent],
  templateUrl: './chat-session-history.component.html',
  styleUrls: ['./chat-session-history.component.scss'],
})
export class ChatSessionHistoryComponent implements OnInit, AfterViewInit {
  @ViewChild('chatHistoryContainer') readonly chatHistoryContainer!: ElementRef<HTMLDivElement>;

  // Reactive Session from AppState
  session = computed(() => AppState.currentChatSession());
  isAtBottom: boolean = true;
  private observer!: IntersectionObserver;

  constructor(
    readonly chatbotEventService: ChatbotEventService,
    readonly chatbotSessionService: ChatbotSessionService
  ) {}

  ngOnInit(): void {
    this.scrollToBottom();

    // Listen to session updates and refresh view dynamically
    this.chatbotEventService.onSessionChanged.subscribe(() => this.scrollToBottom());
    this.chatbotEventService.onPromptSent.subscribe(() => this.scrollToBottom());
    this.chatbotEventService.onPromptAnswerReceived.subscribe(() => this.scrollToBottom());
  }

  ngAfterViewInit(): void {
    this.setupScrollObserver();
  }

  private setupScrollObserver(): void {
    if (!this.chatHistoryContainer || !this.chatHistoryContainer.nativeElement) return;

    this.observer = new IntersectionObserver(
      ([entry]) => {
        this.isAtBottom = entry.isIntersecting;
      },
      { root: this.chatHistoryContainer.nativeElement, threshold: 0.9 }
    );

    const lastElement = this.chatHistoryContainer.nativeElement.lastElementChild;
    if (lastElement) {
      this.observer.observe(lastElement);
    }
  }

  onScroll(): void {
    const container = this.chatHistoryContainer.nativeElement;
    const isScrolledToBottom =
      container.scrollHeight - container.scrollTop <= container.clientHeight + 150;

    this.isAtBottom = isScrolledToBottom;
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatHistoryContainer?.nativeElement) {
        this.chatHistoryContainer.nativeElement.scrollTo({
          top: this.chatHistoryContainer.nativeElement.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, 10);
  }
}
