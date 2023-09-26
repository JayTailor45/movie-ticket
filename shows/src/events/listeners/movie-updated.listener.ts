import {
  Listener,
  Subjects,
  MovieUpdatedEvent,
  errors as Err,
} from "@tj-movies-ticket/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Movie } from "../../models/movie";

export class MovieUpdatedListener extends Listener<MovieUpdatedEvent> {
  readonly subject = Subjects.MOVIE_UPDATED;
  queueGroupName = queueGroupName;

  async onMessage(data: MovieUpdatedEvent["data"], msg: Message) {
    const movie = await Movie.findByEvent(data);

    if (!movie) {
      throw new Err.NotFoundError();
    }

    const {
      name,
      description,
      actors,
      director,
      genres,
      languages,
      releaseDate,
      version,
    } = data;

    movie.set({
      name,
      description,
      actors,
      director,
      genres,
      languages,
      releaseDate,
      version,
    });

    await movie.save();

    msg.ack();
  }
}
