// src/api/books.js
const BASE_URL = "https://api.themoviedb.org/3/movie";
const TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmYTA3YTcxNTUzMmMxYTk2ODRmZDRjNTYxMDk1Y2NhYSIsIm5iZiI6MTcyNzg2MjY5OS43NTgwMDAxLCJzdWIiOiI2NmZkMTdhYjZjMzY1OTg1YzhmMjNmMDEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.aR2TSz0MCOlXSMoLjZClgfD_fcGz_Wf1Sf74gnFcD94"; // your Bearer token

export const fetchBooks = async (page, limit = 6) => {
  try {
    const res = await fetch(`${BASE_URL}/popular?language=en-US&page=${page}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    const data = await res.json();

    // Map TMDb results to your BookCard format
    const books = data.results.map((b) => ({
      id: b.id,
      title: b.title,
      author: b.original_title,
      image: `https://image.tmdb.org/t/p/w500${b.poster_path}`,
    }));

    return { books, totalPages: data.total_pages };
  } catch (error) {
    console.error("Error fetching books:", error);
    return { books: [], totalPages: 0 };
  }
};
