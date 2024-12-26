import { ChangeEvent, useRef, useState } from 'react';
import { Loader, Plus, X } from 'react-feather';
import { useForm } from 'react-hook-form';
import { useQuery } from 'react-query';

import CoursesTable from '../components/courses/CoursesTable';
import Layout from '../components/layout';
import LayoutTitle from '../components/shared/LayoutTitle';
import Modal from '../components/shared/Modal';
import Pagination from '../components/shared/Pagination';
import RefreshButton from '../components/shared/RefreshButton';
import useAuth from '../hooks/useAuth';
import CreateCourseRequest from '../models/course/CreateCourseRequest';
import courseService from '../services/CourseService';

export default function Courses() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [orderDirection, setOrderDirection] = useState<'ASC' | 'DESC'>('DESC');
  const [isRefetching, setIsRefetching] = useState(false);
  const [localImg, setLocalImg] = useState<string | ArrayBuffer | null>(null);
  const [addCourseShow, setAddCourseShow] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { authenticatedUser } = useAuth();
  const { data, isLoading, refetch } = useQuery(
    ['courses', name, description],
    () =>
      courseService.findAll({
        name: name || undefined,
        description: description || undefined,
        limit,
        page,
        orderDirection,
      }),
  );

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<CreateCourseRequest>();

  const saveCourse = async (createCourseRequest: CreateCourseRequest) => {
    try {
      await courseService.save(createCourseRequest);
      setAddCourseShow(false);
      reset();
      setError(null);
      refetch();
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  const resetLocalImg = () => {
    setLocalImg(null);
  };

  const handleFilterChange = () => {
    setIsRefetching(true);
    refetch();
    setTimeout(() => {
      setIsRefetching(false);
    }, 500);
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getImg = async (id: string) => {
    const imgUrl = await courseService.getImg(id);
    return imgUrl;

  };

  const uploadImage = async (id: string, file: File) => {
    const resp = await courseService.uploadImage(id, file);
    if (resp) {
      await getImg(id);
    }
    await refetch();
  };

  const onSelectedImg = async (

    id: string,
    e: ChangeEvent<HTMLInputElement | null>,
  ) => {
    const files = e.target.files ? e.target.files : null;

    if (!files) {
      return;
    }
    const fr = new FileReader();
    fr.onload = () => {
      setLocalImg(fr.result);
    };
    fr.readAsDataURL(files[0]);

    uploadImage(id, files[0]);
  };

  return (
    <Layout>
      <LayoutTitle title="Manage Courses" />
      <div className="px-5 sm:px-10 py-5">
        {authenticatedUser.role !== 'user' ? (
          <button
            className="btn my-5 flex gap-2 w-full sm:w-auto justify-center"
            onClick={() => setAddCourseShow(true)}
          >
            <Plus /> Add Course
          </button>
        ) : null}
        <div className="table-filter">
          <div className="flex flex-row gap-5">
            <input
              type="text"
              className="input w-1/2"
              placeholder="Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                handleFilterChange();
              }}
            />
            <input
              type="text"
              className="input w-1/2"
              placeholder="Description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                handleFilterChange();
              }}
            />
          </div>
          <select
            name=""
            id=""
            className="input"
            value={limit}
            onChange={(e) => {
              setLimit(+e.target.value);
              handleFilterChange();
            }}
          >
            <option value={10}>Limit</option>
            {Array.from({ length: 10 }, (_, index) => index + 1).map(
              (value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ),
            )}
          </select>
          <select
            name=""
            id=""
            className="input"
            value={orderDirection}
            onChange={(e) => {
              setOrderDirection(e.target.value as 'ASC' | 'DESC');
              handleFilterChange();
            }}
          >
            <option value={'DESC'}>Direction</option>
            <option value={'DESC'}>DESC</option>
            <option value={'ASC'}>ASC</option>
          </select>
          <div className="flex items-center">
            <RefreshButton
              handleFilterChange={handleFilterChange}
              isRefetching={isRefetching}
            />
          </div>
        </div>
        <Pagination
          data={data}
          handleFilterChange={handleFilterChange}
          limit={limit}
          page={page}
          setPage={setPage}
        />
        <CoursesTable
          data={data?.data}
          isLoading={isLoading}
          fileInputRef={fileInputRef}
          handleButtonClick={handleButtonClick}
          localImg={localImg}
          onSelectedImg={onSelectedImg}
          uploadImage={uploadImage}
          resetLocalImg={resetLocalImg}
        />
      </div>

      <Modal show={addCourseShow}>
        <div className="flex">
          <h1 className="font-semibold mb-3">Add Course</h1>
          <button
            className="ml-auto focus:outline-none"
            onClick={() => {
              reset();
              setAddCourseShow(false);
            }}
          >
            <X size={30} />
          </button>
        </div>
        <hr />

        <form
          className="flex flex-col gap-5 mt-5"
          onSubmit={handleSubmit(saveCourse)}
        >
          <input
            type="text"
            className="input"
            placeholder="Name"
            disabled={isSubmitting}
            required
            {...register('name')}
          />
          <input
            type="text"
            className="input"
            placeholder="Description"
            disabled={isSubmitting}
            required
            {...register('description')}
          />
          <button className="btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader className="animate-spin mx-auto" />
            ) : (
              'Save'
            )}
          </button>
          {error ? (
            <div className="text-red-500 p-3 font-semibold border rounded-md bg-red-50">
              {error}
            </div>
          ) : null}
        </form>
      </Modal>
    </Layout>
  );
}
