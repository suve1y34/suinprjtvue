export const EP = {
  aladin: {
    search: '/search/aladin',
  },
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    resetPassword: "/auth/resetPw",
    register: "/auth/register",
  },
  books: {
    list: '/books/list',
    detail: '/books/detail',
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