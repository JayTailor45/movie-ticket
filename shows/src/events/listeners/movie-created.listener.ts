import {
  Listener,
  Subjects,
  MovieCreatedEvent,
} from "@tj-movies-ticket/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Movie } from "../../models/movie";

export class MovieCreatedListener extends Listener<MovieCreatedEvent> {
  readonly subject = Subjects.MOVIE_CREATED;

  queueGroupName = queueGroupName;

  async onMessage(data: MovieCreatedEvent["data"], msg: Message) {
    const {
      id,
      name,
      actors,
      description,
      director,
      genres,
      languages,
      releaseDate,
      version,
    } = data;

    const movie = Movie.build({
      id,
      name,
      description,
      actors,
      genres,
      director,
      languages,
      releaseDate,
      version,
    });

    await movie.save();

    msg.ack();
  }
}
