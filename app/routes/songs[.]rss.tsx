import type { LoaderFunction } from "remix";

import { db } from "~/utils/db.server";

function escapeCdata(s: string) {
  return s.replace(/\]\]>/g, "]]]]><![CDATA[>");
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const loader: LoaderFunction = async ({ request }) => {
  const songs = await db.song.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: { owner: { select: { username: true } } },
  });

  const host =
    request.headers.get("X-Forwarded-Host") ?? request.headers.get("host");
  if (!host) {
    throw new Error("Could not determine domain URL.");
  }
  const protocol = host.includes("localhost") ? "http" : "https";
  const domain = `${protocol}://${host}`;
  const songsUrl = `${domain}/songs`;

  const rssString = `
    <rss xmlns:blogChannel="${songsUrl}" version="2.0">
      <channel>
        <title>Remix Jokes</title>
        <link>${songsUrl}</link>
        <description>Some funny jokes</description>
        <language>en-us</language>
        <generator>Kody the Koala</generator>
        <ttl>40</ttl>
        ${songs
          .map((song: any) =>
            `
            <item>
              <title><![CDATA[${escapeCdata(song.name)}]]></title>
              <description><![CDATA[A song called ${escapeHtml(
                song.name
              )}]]></description>
              <author><![CDATA[${escapeCdata(
                song.jokester.username
              )}]]></author>
              <pubDate>${song.createdAt.toUTCString()}</pubDate>
              <link>${songsUrl}/${song.id}</link>
              <guid>${songsUrl}/${song.id}</guid>
            </item>
          `.trim()
          )
          .join("\n")}
      </channel>
    </rss>
  `.trim();

  return new Response(rssString, {
    headers: {
      "Cache-Control": `public, max-age=${60 * 10}, s-maxage=${60 * 60 * 24}`,
      "Content-Type": "application/xml",
      "Content-Length": String(Buffer.byteLength(rssString)),
    },
  });
};
