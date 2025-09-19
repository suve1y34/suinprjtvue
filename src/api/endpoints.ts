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
    publicReviews: '/books/reviews/public/list',
  },
  shelves: {
    myShelf: "/shelves/books/me",
    list: "/shelves/books/list",
    add: "/shelves/books/add",
    update: "/shelves/books/update",
    remove: "/shelves/books/remove",
    updateProgress: "/shelves/books/updateProgress",
    updateMemo: "/shelves/books/updateMemo",
    stats: "/shelves/books/stats",
    finishedByMonth: '/shelves/books/calendar',
  },
  users: {
    myInfo: '/users/me',
    myGoal: '/users/goal-progress',
  },

} as const;

export type EndPoints = typeof EP;