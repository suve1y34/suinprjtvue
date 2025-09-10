export const EP = {
  aladin: {
    search: '/search/aladin',
  },
  auth: {
    logout: '/auth/logout',
  },
  books: {
    list: '/books/list',
    detail: '/books/detail',
    publicMemos: '/books/memos/public/list',
  },
  shelves: {
    myShelf: "/shelves/books/me",
    list: "/shelves/books/list",
    add: "/shelves/books/add",
    update: "/shelves/books/update",
    remove: "/shelves/books/remove",
    updateProgress: "/shelves/books/updateProgress",
    updateMemo: "/shelves/books/updateMemo",
  },
  users: {
    myInfo: '/users/me',
  },

} as const;

export type EndPoints = typeof EP;