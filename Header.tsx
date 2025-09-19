
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center py-8 my-4 border-b-2 border-cyan-500/30">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
        <span className="block text-cyan-400">オフィス爆弾戦士！</span>
        <span className="block text-gray-300 text-2xl sm:text-3xl mt-2">ビッグサイト大作戦</span>
      </h1>
      <p className="mt-4 text-lg sm:text-xl text-gray-400">
        (Office Bomber: Big Sight Mayhem!)
      </p>
       <p className="mt-2 text-md max-w-2xl mx-auto text-gray-500">
        AIを使って、このユニークなゲームのコンセプトを視覚化しましょう。
        (Let's visualize this unique game concept using AI.)
      </p>
    </header>
  );
};

export default Header;
