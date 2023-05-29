import Head from "next/head";

interface Props {
  title?: string;
  description?: string;
}

export default function SharedHead({
  title = "SoDead",
  description = "SoDead",
}: Props) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}
