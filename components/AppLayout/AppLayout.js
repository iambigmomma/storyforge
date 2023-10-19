import { useUser } from '@auth0/nextjs-auth0/client';
import { faCoins } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import Link from 'next/link';
import { useContext, useEffect } from 'react';
import PostsContext from '../../context/postsContext';
import { Logo } from '../Logo';

export const AppLayout = ({
  children,
  availableTokens,
  posts: postsFromSSR,
  postId,
  postCreated,
}) => {
  const { user } = useUser();

  // const { setPostsFromSSR, posts, getPosts, noMorePosts } =
  //   useContext(PostsContext);

  // useEffect(() => {
  //   setPostsFromSSR(postsFromSSR);
  //   if (postId) {
  //     const exists = postsFromSSR.find((post) => post._id === postId);
  //     if (!exists) {
  //       getPosts({ getNewerPosts: true, lastPostDate: postCreated });
  //     }
  //   }
  // }, [postsFromSSR, setPostsFromSSR, postId, postCreated, getPosts]);

  return (
    <div className="grid grid-cols-[300px_1fr] h-screen max-h-screen">
      <div className="flex flex-col overflow-hidden text-white">
        <div className="px-2 bg-slate-800">
          <Logo />
          <Link href="/image/new" className="btn">
            New Story
          </Link>
          <Link href="/token-topup" className="block mt-2 text-center">
            <FontAwesomeIcon icon={faCoins} className="text-yellow-500" />
            <span className="pl-1">{availableTokens} tokens available</span>
          </Link>
        </div>
        {/* <div className="flex-1 px-4 overflow-auto bg-gradient-to-b from-slate-800 to-cyan-800">
          {posts.map((post) => (
            <Link
              key={post._id}
              href={`/image/${post._id}`}
              className={`py-1 border border-white/0 block text-ellipsis overflow-hidden whitespace-nowrap my-1 px-2 bg-white/10 cursor-pointer rounded-sm ${
                postId === post._id ? 'bg-white/20 border-white' : ''
              }`}
            >
              {post.topic}
            </Link>
          ))}
          {!noMorePosts && (
            <div
              onClick={() => {
                getPosts({ lastPostDate: posts[posts.length - 1].created });
              }}
              className="mt-4 text-sm text-center cursor-pointer hover:underline text-slate-400"
            >
              Load more posts
            </div>
          )}
        </div> */}
        <div className="flex items-center h-20 gap-2 px-2 border-t bg-cyan-800 border-t-black/50">
          {!!user ? (
            <>
              <div className="min-w-[50px]">
                <Image
                  src={user.picture}
                  alt={user.name}
                  height={50}
                  width={50}
                  className="rounded-full"
                />
              </div>
              <div className="flex-1">
                <div className="font-bold">{user.email}</div>
                <Link className="text-sm" href="/api/auth/logout">
                  Logout
                </Link>
              </div>
            </>
          ) : (
            <Link href="/api/auth/login">Login</Link>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};
