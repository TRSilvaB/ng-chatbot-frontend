import { Component, Input } from '@angular/core';

export enum VoteStyle {
  Thumbs = 'thumbs',
  Rating = 'rating',
}

@Component({
  selector: 'app-chat-session-message-vote',
  standalone: true,
  templateUrl: './chat-session-message-vote.component.html',
  styleUrls: ['./chat-session-message-vote.component.scss'],
})
export class ChatSessionMessageVoteComponent {
  @Input() voteStyle: string = VoteStyle.Thumbs;
  @Input() maxRating: number = 5;

  ratingOptions: number[] = [];
  selectedRating = 0;
  hoverRating = 0;
  hasVoted = false;

  ngOnInit() {
    this.initializeRatingOptions();
  }

  initializeRatingOptions() {
    this.ratingOptions = Array.from({ length: this.maxRating }, (_, i) => i + 1);
  }

  vote(vote: string) {
    console.log('Voted:', vote);
  }

  voteStar(vote: number) {
    if (!this.hasVoted) {
      this.selectedRating = vote;
      this.hasVoted = true;
      console.log('Star Voted:', vote);
    }
  }

  hoverStar(star: number) {
    if (!this.hasVoted) {
      this.hoverRating = star
    }
  }
}
