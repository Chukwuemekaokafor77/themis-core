"use client";
import React from 'react';

const ListComponent = () => {
  const listItems = [
    { text: 'Google', url: 'https://www.google.com' },
    { text: 'Facebook', url: 'https://www.facebook.com' },
    { text: 'Twitter', url: 'https://www.twitter.com' },
    // Add more items as needed
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <ul className="space-y-4">
        {listItems.map((item, index) => (
          <li key={index} className="p-4 bg-white shadow rounded">
            <a href={item.url} className="text-blue-500 hover:underline">
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListComponent;