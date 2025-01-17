import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/client";
import { RichText } from "prismic-dom";

import { getPrismicClient } from "../../../services/prismic";

import styles from '../post.module.scss';
import { useEffect } from "react";
import { useRouter } from "next/router";

type PostsPreviewProps = {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  },
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('publication', String(slug), {});

  const post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content.splice(0, 4)),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  };

  return {
    props: {
      post,
    },
    redirect: 60 * 30 //30 min
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export default function PostPreview({ post }: PostsPreviewProps) {
  const router = useRouter();
  const [session] = useSession();

  useEffect(() => {
    if (session?.activeSubscription) {
      router.push(`/posts/${post.slug}`);
    }
  }, [session]);

  return(
    <>
      <Head>
        <title>
          {post.title} | Ig.news
        </title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>
            {post.title}
          </h1>
          <time>
            {post.updatedAt}
          </time>
          <div 
            className={`${styles.postContent} ${styles.previewContent}`}
            dangerouslySetInnerHTML={{ __html:post.content }} 
          />
          <div className={styles.continueReading}>
            Wanna continue reading?
            <Link href="/">
              <a href="">
                Subscribe now 🤗
              </a>
            </Link>
          </div>
        </article>
      </main>
    </>
  )
};
