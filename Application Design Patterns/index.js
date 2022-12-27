const autoCompleteConfig ={
    renderOption(movie){
        const imgSrc = movie.Poster === "N/A" ? "" : movie.Poster;
        return `
        <img src="${imgSrc}"/>
        ${movie.Title} (${movie.Year})
    `
    },
    inputValue(movie){
        return movie.Title
    },
    async fetchData(searchTerm) {
     
        const response = await axios.get("https://www.omdbapi.com/", {
            params: {
                apikey: "6535b522",
                s: searchTerm
            }
        });

        if(response.data.Error) {
            return [];
        }
    
        return response?.data?.Search;
    }
};

createAutoComplete({
    ...autoCompleteConfig,
    root: document.querySelector("#left-autocomplete"),
    onOptionSelect(movie){
        document.querySelector(".tutorial").classList.add("is-hidden")
        onMovieSelect(movie, document.querySelector("#left-summary"), "left");
    }
});

createAutoComplete({
    ...autoCompleteConfig,
    root: document.querySelector("#right-autocomplete"),
    onOptionSelect(movie){
        document.querySelector(".tutorial").classList.add("is-hidden")
        onMovieSelect(movie, document.querySelector("#right-summary"), "right");
    }
});

let leftMovie;
let rightMovie;

const onMovieSelect = async(movie, summaryElement, side) => {
    const response = await axios.get("https://www.omdbapi.com/", {
        params: {
            apikey: "6535b522",
            i: movie.imdbID
        }
    }); 

    summaryElement.innerHTML = movieTemplate(response.data);

    if (side === "left") {
        leftMovie = response.data;
    } else {
        rightMovie = response.data;
    }

    if (leftMovie && rightMovie) {
        runComparison();
    }
};

const runComparison =() => {
     const leftSideStats = Array.from(document.querySelectorAll("#left-summary .notification"));
     const rightSideStats = Array.from(document.querySelectorAll("#right-summary .notification"));

     leftSideStats.forEach((leftStat, index)=>{
        const rightStat = rightSideStats[index];

        const leftSideValue = parseInt(leftStat.dataset.value);
        const rightSideValue = parseInt(rightStat.dataset.value);

        if(rightSideValue > leftSideValue) {
            leftStat.classList.remove("is-primary");
            leftStat.classList.add("is-warning");
        } else {
            rightStat.classList.remove("is-primary");
            rightStat.classList.add("is-warning");
        }


     });

};

const movieTemplate = (movieDetail) => {
    const dollars = Number((movieDetail?.BoxOffice?.replace(/(\$|,)/g,"")));
    console.log(movieDetail)
    const metascore = Number(movieDetail?.Metascore?.replace(/(\$|,)/g,""));
    const imdbRating = Number(movieDetail?.imdbRating?.replace(/(\$|,)/g,""));
    const imdbVotes = Number(movieDetail?.imdbVotes?.replace(/(\$|,)/g,""));

    const awards = movieDetail?.Awards.split(" ").reduce((prev, word) =>{
        const value = Number(word);
        if(isNaN(value)){
            return prev;
        } else {return prev + value}
    }, 0)

    console.log(dollars,metascore,imdbRating,imdbVotes, awards)
    return `
        <article class="media">
            <figure class="media-left">
                <p class="image">
                    <img src="${movieDetail.Poster}"/>
                </p>
            </figure>
            <div class="media-content">
                <h1>${movieDetail.Title}</h1>
                <h4>${movieDetail.Genre}</h4>
                <p>${movieDetail.Plot}</p>
            </div>
        </article>
        <article data-value=${awards} class="notification is-primary">
            <p class="title">${movieDetail?.Awards||0}</p>
            <p class="subtitle">Awards</p>
        </article>
        <article data-value=${dollars} class="notification is-primary">
            <p class="title">${movieDetail?.BoxOffice||0}</p>
            <p class="subtitle">Box Office</p>
        </article>
        <article data-value=${metascore}  class="notification is-primary">
            <p class="title">${movieDetail?.Metascore||0}</p>
            <p class="subtitle">Metascore</p>
        </article>
        <article data-value=${imdbRating}  class="notification is-primary">
            <p class="title">${movieDetail?.imdbRating||0}</p>
            <p class="subtitle">imdbRating</p>
        </article>
        <article data-value=${imdbVotes}  class="notification is-primary">
            <p class="title">${movieDetail?.imdbVotes||0}</p>
            <p class="subtitle">imdbVotes</p>
        </article>
    `
}