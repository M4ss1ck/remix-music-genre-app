import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

// https://www.prisma.io/docs/guides/database/seed-database

async function seed() {
  
  const kody = await db.user.upsert({
    where:{username: "kody"},
    update: {},
    create: {
      username: "kody",
      // this is a hashed version of "twixrox"
      passwordHash:
        "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
    },
  });
  const massick = await db.user.upsert({
    where:{username: "Massick"},
    update: {},
    create: {
      username: "Massick",
      // this is a hashed version of "twixrox"
      passwordHash:
        "$2a$12$.diXWqQPKZysuL0YH.jav.pJHRiowy/SuKzItTeM7chKLjVeGDQv6",
      songs: {
        create: {
          title: "Empire",
          artist: {
            create: {
              name: "Delta Heavy",              
            }
          },
          genres: {
            create: {
              name: "DnB",
            }
          }
        }
      }
    },
  });
  // await Promise.all(
  //   getSongs().map((song) => {
  //     const newArtist = song.artist
  //     db.artist.create({
  //       name: newArtist,
  //     })
  //     const data = { ownerId: massick.id, ...song };
  //     return db.song.create({ data });
  //   })
  // );
}

seed();

function getSongs() {
  return [
    {
      title: "Empire",
      artist: {name: "Delta Heavy"},      
    },
    {
      title: "Someone like you",
      artist: {name: "Adele"},
    },
    {
      title: "Sunlight",
      artist: {name: "Modestep"},
    },
    {
      title: "Barbie girl",
      artist: {name: "Aqua"},
    },
    {
      title: "Waiting for love",
      artist: {name: "Avicii"},
    }
  ];
}