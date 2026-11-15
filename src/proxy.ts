import { NextResponse, type NextRequest } from "next/server";
import { parseMovieId } from "@/lib/tmdb/movie";

// Com Cache Components a página é servida a partir de uma casca pré-renderizada (status 200),
// então notFound() na página não consegue mudar o status. Para ID inválido, respondemos
// aqui com a página 404 e status 404 real, sem chegar à rota.
export function proxy(request: NextRequest) {
  const raw = request.nextUrl.pathname.split("/")[2] ?? "";
  let id = "";
  try {
    id = decodeURIComponent(raw);
  } catch {
    // percent-encoding malformado: id fica vazio e cai no 404
  }
  if (parseMovieId(id) === null) {
    return NextResponse.rewrite(new URL("/filme-invalido", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: "/filme/:id" };
