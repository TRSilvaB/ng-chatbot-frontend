import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChatbotBrainService } from '../../chatbot-services/chatbot-brain/chatbot-brain.service';
import { ChatbotBaseComponentComponent } from '../chatbot-base-component/chatbot-base-component.component';
import { BlankModalComponent } from "../../../common/components/blank-modal/blank-modal.component";
import { InputSelectorComponent } from "../../../common/components/input-components/input-selector/input-selector.component";
import { ChatbotModelSelectorComponent } from "../chatbot-model-selector/chatbot-model-selector.component";
import { InputToggleComponent } from "../../../common/components/input-components/input-toggle/input-toggle.component";
import { InputBooleanSelectorComponent } from "../../../common/components/input-components/input-boolean-selector/input-boolean-selector.component";

@Component({
  selector: 'app-chatbot-settings',
  standalone: true,
  templateUrl: './chatbot-settings.component.html',
  styleUrls: ['./chatbot-settings.component.scss'],
  imports: [BlankModalComponent, InputSelectorComponent, ChatbotModelSelectorComponent, InputToggleComponent, InputBooleanSelectorComponent]
})
export class ChatbotSettingsComponent extends ChatbotBaseComponentComponent {
  @ViewChild('ollamaModelNameInput') ollamaModelNameInput: ElementRef<HTMLInputElement> | undefined;

  collectionCount: number = 0;

  optionStates = {
    options: 'options',
    prePrompt: 'pre-prompt',
  }

  optionsState: string = this.optionStates.options;

  constructor(
    brain: ChatbotBrainService
  ) {
    super(brain);

    brain.chatbotEventService.tempEvent_OnChromaDBCount.subscribe((count) => {
      this.collectionCount = count;
    });
  }

  toggleOptionsState(state: string): void {
    this.optionsState = state;
  }

  // Handle changes to the prompt settings
  onSeedChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    ChatbotBrainService.chatbotSettings.options.seed = Number(input.value);
  }

  onTopKChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    ChatbotBrainService.chatbotSettings.options.top_k = Number(input.value);
  }

  onTopPChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    ChatbotBrainService.chatbotSettings.options.top_p = Number(input.value);
  }

  onTemperatureChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    ChatbotBrainService.chatbotSettings.options.temperature = Number(input.value);
  }

  onRepeatPenaltyChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    ChatbotBrainService.chatbotSettings.options.repeat_penalty = Number(input.value);
  }

  onStopTokensChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    ChatbotBrainService.chatbotSettings.options.stop = input.value.split(',').map(token => token.trim());
  }

  // Handle the pre-prompt input
  onPrePromptChange(event: Event): void {
    const input = event.target as HTMLTextAreaElement;
    ChatbotBrainService.chatbotSettings.prePrompt = input.value;
  }

  addModel() {
    console.log('Adding model');
    console.log('Model name:', this.ollamaModelNameInput?.nativeElement.value);
    const name = this.ollamaModelNameInput?.nativeElement.value;

    if (name && name.length > 0) {
      this.brain.chatbotApiService.tempAddModel(name);
      if (this.ollamaModelNameInput) {
        this.ollamaModelNameInput.nativeElement.value = '';
      }
    }
  }

  removeModel() {
    const name = this.ollamaModelNameInput?.nativeElement.value;

    if (name && name.length > 0) {
      this.brain.chatbotApiService.tempRemoveModel(name);
      if (this.ollamaModelNameInput) {
        this.ollamaModelNameInput.nativeElement.value = '';
      }
    }
  }

  onInputChanged(inputID: string, value: any): void {
    if (inputID === 'chatbot_connection_name') {
      this.brain.updateChatbotConnectionName(value as string);
    }

    if (inputID === 'chatbot_model') {
      this.brain.updateChatbotModel(value as string);
    }

    if (inputID === 'chatbot_use_options') {
      this.brain.updateChatbotUseOptions(value as boolean);
    }

    if (inputID === 'chatbot_stream') {
      this.brain.updateChatbotStream(value as boolean);
    }

    console.log('Input changed:', inputID, value);
    console.log('Configs:', ChatbotBrainService.chatbotSettings);
  }

  onCollectionCountClicked() {
    this.brain.chatbotApiService.tempChromaDbCount();
  }
}
