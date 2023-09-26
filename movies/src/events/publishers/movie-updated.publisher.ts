import {
  Publisher,
  Subjects,
  MovieUpdatedEvent,
} from "@tj-movies-ticket/common";

export class MovieUpdatedPublisher extends Publisher<MovieUpdatedEvent> {
  readonly subject = Subjects.MOVIE_UPDATED;
}
