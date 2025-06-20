import Link from "next/link";
import { Button } from "~/components/ui/Button";
import { BookGrid } from "~/features/library/books/components";
import { getAllPublishedBooks } from "~/server/db/queries/library/books";

async function Library() {
  const books = await getAllPublishedBooks();
  return (
    <div>
      <Button asChild>
        <Link href="/library/book/add">Add Book</Link>
      </Button>
      <Button asChild>
        <Link href="/library/book/2/edit">Edit Book</Link>
      </Button>
      <BookGrid books={books} />
    </div>
  );
}

export default Library;
