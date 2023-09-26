import {
  MovieCreatedEvent,
  Publisher,
  Subjects,
} from "@tj-movies-ticket/common";

export class MovieCreatedPublisher extends Publisher<MovieCreatedEvent> {
  readonly subject = Subjects.MOVIE_CREATED;
}
