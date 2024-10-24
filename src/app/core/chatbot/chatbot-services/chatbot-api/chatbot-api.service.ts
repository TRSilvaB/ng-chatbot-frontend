import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ConfigService } from '../../../config/config.service';
import { ChatbotEventService } from '../chatbot-events/chatbot-event.service';
import { ChatbotBrainService } from '../chatbot-brain/chatbot-brain.service';

@Injectable({
  providedIn: 'root'
})
export class ChatbotApiService {
  private webSocket: WebSocket | null = null;  // WebSocket instance
  private webSocketSubject: Subject<string> | null = null;  // Subject to stream responses

  connectionName: string = '';

  constructor(
    private readonly http: HttpClient,
    private readonly configService: ConfigService,
    private readonly chatbotEventService: ChatbotEventService
  ) {

    chatbotEventService.onChatbotSettingsChanged.subscribe(() => {
      this.connectionName = configService.formatConnectionName(ChatbotBrainService.chatbotSettings.connectionName);
    });

    setTimeout(() => {
      this.connectionName = configService.formatConnectionName(ChatbotBrainService.chatbotSettings.connectionName);
    }, 100);
  }


  // -----------------------------------------------------
  // Temporary Chroma DB Injestion and Deletion Methods
  // -----------------------------------------------------

  private readonly tempChromaBbInjestionURL = "http://127.0.0.1:8000/chatbot/temp/chroma/ingest";
  private readonly tempChromaBbDeletionURL = "http://127.0.0.1:8000/chatbot/temp/chroma/delete";

  tempChromaDbIngestion(): void {
    const request = this.http.get(this.tempChromaBbInjestionURL);
    request.subscribe({
      next: (response) => {
        console.log('Chroma BB Injestion Response:', response);
      },
      error: (error) => {
        console.error('Error from Chroma BB Injestion:', error);
      },
      complete: () => {
        console.log('Chroma BB Injestion Complete');
      }
    });
  }

  tempChromaDbDeletion(): void {
    const request = this.http.get(this.tempChromaBbDeletionURL);
    request.subscribe({
      next: (response) => {
        console.log('Chroma BB Deletion Response:', response);
      },
      error: (error) => {
        console.error('Error from Chroma BB Deletion:', error);
      },
      complete: () => {
        console.log('Chroma BB Deletion Complete');
      }
    });
  }



  // -----------------------------------------------------
  // WebSocket Management
  // -----------------------------------------------------

  private createWebSocket(): Subject<string> {
    if (this.webSocket) {
      return this.webSocketSubject!;
    }

    const webSocketUrl = `ws:${this.configService.getChatUrlByConnectionName(this.connectionName)}/stream`;
    this.webSocket = new WebSocket(webSocketUrl);
    this.webSocketSubject = new Subject<string>();

    this.webSocket.onopen = () => {
      console.log('WebSocket connection opened');
    };

    this.webSocket.onmessage = (event) => {
      this.webSocketSubject!.next(event.data);  // Stream WebSocket responses
    };

    this.webSocket.onclose = () => {
      console.log('WebSocket connection closed');
      this.webSocketSubject!.complete();
      this.webSocket = null;  // Clean up
    };

    this.webSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.webSocketSubject!.error('WebSocket error: ' + error);
    };

    return this.webSocketSubject!;
  }

  closeWebSocket() {
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
      this.webSocketSubject = null;
    }
  }


  // -----------------------------------------------------
  // API Connection by Connection Name
  // -----------------------------------------------------

  getAvailableModelNames(): Observable<any> {
    const url = this.configService.getModelsUrlByConnectionName(this.connectionName);
    console.log('Getting available model names from:', url);

    return this.http.get<any>(this.configService.getModelsUrlByConnectionName(this.connectionName));
  }

  sendChatPromptAndGetChatPromptAnswer(prompt: string, model_name: string): Observable<any> {
    if (ChatbotBrainService.chatbotSettings.prePrompt != null && ChatbotBrainService.chatbotSettings.prePrompt != '') {
      prompt = ChatbotBrainService.chatbotSettings.prePrompt + '\n' + prompt;
    }

    if (ChatbotBrainService.chatbotSettings.stream) {
      return this.ws_sendChatModelAndGetChatPromptAnswer(prompt, model_name);
    } else {
      const requestBody = {
        prompt,
        chat_model_name : model_name
      };

      const url = this.configService.getChatUrlByConnectionName(this.connectionName);
      console.log('Sending prompt:', requestBody, 'API URL:', url);

      return this.http.post<any>(url, requestBody);
    }
  }

  // webSocket
  ws_sendChatModelAndGetChatPromptAnswer(prompt: string, model_name: string): Observable<string> {
    const webSocketSubject = this.createWebSocket();

    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      const requestBody = JSON.stringify({ prompt, model_name });
      this.webSocket.send(requestBody);  // Send the chat prompt over WebSocket
    }

    return webSocketSubject.asObservable();  // Return the response observable
  }

  sendPromptAnswerFeedback(prompt_answer_id: number, vote_type: string): Observable<any> {
    const requestBody = {
      prompt_answer_id,
      vote_type
    };
    return this.http.post<any>(this.configService.getFeedbackUrlByConnectionName(this.connectionName), requestBody);
  }
}