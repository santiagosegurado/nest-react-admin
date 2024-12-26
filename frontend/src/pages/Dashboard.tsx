import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';

import Layout from '../components/layout';
import LayoutTitle from '../components/shared/LayoutTitle';
import useAuth from '../hooks/useAuth';
import useNews from '../hooks/useNews';
import Course from '../models/course/Course';
import courseService from '../services/CourseService';
import statsService from '../services/StatsService';

export default function Dashboard() {
  const [lastCourse, setLastCourse] = useState<Course>(null);
  const { data, isLoading } = useQuery('stats', statsService.getStats);
  const { authenticatedUser } = useAuth();
  const { lastVisitedCourse, saveLastLoginTime, lastLoginTime } = useNews();

  useEffect(() => {
    if (lastVisitedCourse) {
      courseService.findOne(lastVisitedCourse).then(setLastCourse);
    }
  }, []);

  useEffect(() => {
    const date = new Date();
    const formattedDate = date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    saveLastLoginTime(formattedDate);
  }, [saveLastLoginTime]);

  return (
    <Layout>
      <LayoutTitle title="Dashboard" />
      <div className="mt-5 flex flex-col gap-5 px-5 sm:px-10 py-5">
        {!isLoading ? (
          <div className="flex flex-col sm:flex-row gap-5">
            {authenticatedUser?.role === 'admin' && (
              <div className="card shadow text-white bg-blue-500 flex-1">
                <h1 className="font-semibold sm:text-4xl text-center mb-3">
                  {data?.numberOfUsers}

                </h1>
                <p className="text-center sm:text-lg font-semibold">Users</p>
              </div>
            )}
            <div className="card shadow text-white bg-indigo-500 flex-1">
              <h1 className="font-semibold sm:text-4xl mb-3 text-center">
                {data?.numberOfCourses}
              </h1>
              <p className="text-center sm:text-lg font-semibold">Courses</p>
            </div>
            <div className="card shadow text-white bg-green-500 flex-1">
              <h1 className="font-semibold sm:text-4xl mb-3 text-center">
                {data?.numberOfContents}
              </h1>
              <p className="text-center sm:text-lg font-semibold">Contents</p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-7 mt-9">
          <div>
            <h1 className="font-semibold text-4xl text-center text-brandPrimary">
              Welcome {authenticatedUser?.firstName}
            </h1>
          </div>
          <div className="flex flex-col lg:flex-row gap-5">
            {lastCourse && (
              <div className="card shadow flex-1">
                <h3 className="font-semibold sm:text-4xl mb-3 text-center">
                  {lastCourse?.name}
                </h3>
                <p className="text-center sm:text-lg font-semibold">
                  Last visited course
                </p>
              </div>
            )}
            {lastLoginTime && (
              <div className="card shadow flex-1">
                <h3 className="font-semibold sm:text-4xl mb-3 text-center">
                  {lastLoginTime}
                </h3>
                <p className="text-center sm:text-lg font-semibold">
                  Last visited course
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-center">
            <Link to={'/profile'} className="btn no-underline text-inherit">
              Update Profile
            </Link>
          </div>
        </div>
        {/* <UpdateProfile /> */}
      </div>
    </Layout>
  );
}
