import { useEffect, useState } from 'react';

import LocalStorageService from '../services/LocalStorageService';

const LAST_VISITED_COURSE_KEY = 'lastVisitedCourse';
const LAST_LOGIN_TIME_KEY = 'lastLoginTime';

export default function useNews() {
  const [lastVisitedCourse, setLastVisitedCourse] = useState<string | null>(
    LocalStorageService.getItem<string>(LAST_VISITED_COURSE_KEY),
  );
  const [lastLoginTime, setLastLoginTime] = useState<string | null>(
    LocalStorageService.getItem<string>(LAST_LOGIN_TIME_KEY),
  );

  const saveLastVisitedCourse = (courseId: string) => {
    LocalStorageService.setItem(LAST_VISITED_COURSE_KEY, courseId);
    setLastVisitedCourse(courseId);
  };

  const saveLastLoginTime = (loginTime: string) => {
    LocalStorageService.setItem(LAST_LOGIN_TIME_KEY, loginTime);
    setLastLoginTime(loginTime);
  };

  useEffect(() => {
    const storedCourseId = LocalStorageService.getItem<string>(
      LAST_VISITED_COURSE_KEY,
    );
    if (storedCourseId) {
      setLastVisitedCourse(storedCourseId);
    }

    const storedLoginTime = LocalStorageService.getItem<string>(
      LAST_LOGIN_TIME_KEY,
    );
    if (storedLoginTime) {
      setLastLoginTime(storedLoginTime);
    }
  }, []);

  return {
    lastVisitedCourse,
    saveLastVisitedCourse,
    lastLoginTime,
    saveLastLoginTime,
  };
}
