import "./styles.css";
import React, { Component } from "react";

// Initialize the JS client
import { createClient } from "@supabase/supabase-js";
import NavBar from "./components/appbar";
import MovieCard from "./components/movieCard";

const supabase = createClient(
  "https://xlegldcsxvovmhzypyrn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyMDg1MzAxMSwiZXhwIjoxOTM2NDI5MDExfQ.YgadPClT1FaUVm9OBe16oIJ-WXQU35f-uRnFcttXGTU"
);

class App extends Component {
  state = {
    movieNumber: 0,
    listOfMovies: [
      {
        id: 0,
        title: "Movie Title",
        imageURL:
          "https://m.media-amazon.com/images/M/MV5BOGZhM2FhNTItODAzNi00YjA0LWEyN2UtNjJlYWQzYzU1MDg5L2ltYWdlL2ltYWdlXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_UY1200_CR88,0,630,1200_AL_.jpg",
        badbadvotes: 0,
        goodbadvotes: 0
      }
    ]
  };

  async componentDidMount() {
    //TODO:
    // -[ ] load a set number of (random?) movies
    // Make a request to load "all the movies"
    let { data: movies, error } = await supabase.from("movies").select("*");
    this.setState({ listOfMovies: movies });
    console.log(await error);
    this.updateMovie(0);
    //populate the first movie
  }

  updateMovie(movieNumber) {
    this.setState({
      imageURL: this.state.listOfMovies[movieNumber].imageURL,
      title: this.state.listOfMovies[movieNumber].title,
      id: this.state.listOfMovies[movieNumber].id
    });
  }

  async updateVotes(movieNumber, voteCategory) {
    //this function can be simplified a looooot

    //grab the latest ratings from the server
    let { data: movieStats, error } = await supabase
      .from("movies")
      .select("*")
      .match({ id: this.state.listOfMovies[movieNumber].id });

    const movieUpdating = movieStats[0];

    console.log(
      `updating vote of ${movieUpdating.title} (ID: ${movieUpdating.id})`
    );

    //check which way we should vote, and then update the count
    //(what happens when two people write at the same time? It fails?)
    if (voteCategory === "badbad") {
      const { data, error } = await supabase
        .from("movies")
        .update({
          badbadvotes: movieUpdating.badbadvotes + 1
        })
        .match({ id: movieUpdating.id });
      console.log(await data);
      console.log(await error);
    } else if (voteCategory === "skip") {
      const { data, error } = await supabase
        .from("movies")
        .update({
          skipcount: movieUpdating.skipcount + 1
        })
        .match({ id: movieUpdating.id });

      console.log(await data);
      console.log(await error);
    } else {
      const { data, error } = await supabase
        .from("movies")
        .update({
          goodbadvotes: movieUpdating.goodbadvotes + 1
        })
        .match({ id: movieUpdating.id });

      console.log(await data);
      console.log(await error);
    }
  }

  handleSkip() {
    const numberOfMovies = Object.keys(this.state.listOfMovies).length;
    // if we have run out of movies...
    const previousMovie = this.state.movieNumber;
    let nextMovie = 0;
    if (this.state.movieNumber >= numberOfMovies - 1) {
      console.log("we've run out of movies");
    } else {
      nextMovie = previousMovie + 1;
    }
    this.updateMovie(nextMovie);
    this.setState({ movieNumber: nextMovie });
  }

  handleVote = (rating) => {
    const numberOfMovies = Object.keys(this.state.listOfMovies).length;
    // if we have run out of movies...
    const previousMovie = this.state.movieNumber;
    let nextMovie = 0;

    console.log(`we're on movie ${previousMovie} of ${numberOfMovies}`);

    if (this.state.movieNumber >= numberOfMovies - 1) {
      console.log("we've run out of movies");
    } else {
      nextMovie = previousMovie + 1;
    }
    // update the counter
    this.setState({ movieNumber: nextMovie });

    //update the ui
    this.updateMovie(nextMovie);

    //then sends the server response
    this.updateVotes(previousMovie, rating);
  };

  render() {
    return (
      <div className="app">
        <NavBar name="hello" />
        <MovieCard title={this.state.title} imageURL={this.state.imageURL} />

        <div
          className="badBad buttonContainer"
          onClick={this.handleVote.bind(this, "badbad")}
        >
          bad
          <br />
          bad
        </div>
        <div
          className="skip buttonContainer"
          onClick={this.handleVote.bind(this, "skip")}
        >
          skip
        </div>
        <div
          className="goodBad buttonContainer"
          onClick={this.handleVote.bind(this, "goodbad")}
        >
          good
          <br />
          bad
        </div>
      </div>
    );
  }
}

export default App;
