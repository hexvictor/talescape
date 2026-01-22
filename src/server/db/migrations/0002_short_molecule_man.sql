ALTER TABLE "talescape_author" ADD COLUMN "imageId" integer;--> statement-breakpoint
ALTER TABLE "talescape_author" ADD COLUMN "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE "talescape_author" ADD COLUMN "updatedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "talescape_book" ADD COLUMN "coverImageId" integer;--> statement-breakpoint
ALTER TABLE "talescape_author" ADD CONSTRAINT "talescape_author_imageId_talescape_image_id_fk" FOREIGN KEY ("imageId") REFERENCES "public"."talescape_image"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talescape_book" ADD CONSTRAINT "talescape_book_coverImageId_talescape_image_id_fk" FOREIGN KEY ("coverImageId") REFERENCES "public"."talescape_image"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talescape_author" DROP COLUMN "imageUrl";--> statement-breakpoint
ALTER TABLE "talescape_book" DROP COLUMN "coverImageUrl";