import { useState } from 'react';
import { Loader, Plus, X } from 'react-feather';
import { useForm } from 'react-hook-form';
import { useQuery } from 'react-query';

import Layout from '../components/layout';
import LayoutTitle from '../components/shared/LayoutTitle';
import Modal from '../components/shared/Modal';
import Pagination from '../components/shared/Pagination';
import RefreshButton from '../components/shared/RefreshButton';
import UsersTable from '../components/users/UsersTable';
import useAuth from '../hooks/useAuth';
import CreateUserRequest from '../models/user/CreateUserRequest';
import userService from '../services/UserService';

export default function Users() {
  const { authenticatedUser } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isRefetching, setIsRefetching] = useState(false);

  const [addUserShow, setAddUserShow] = useState<boolean>(false);
  const [error, setError] = useState<string>();

  const { data, isLoading, refetch } = useQuery(
    ['users', firstName, lastName, username, role, page, limit],
    async () => {
      return await userService.findAll({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        username: username || undefined,
        role: role || undefined,
        page,
        limit,
      });
    },
  );

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<CreateUserRequest>();

  const saveUser = async (createUserRequest: CreateUserRequest) => {
    try {
      await userService.save(createUserRequest);
      setAddUserShow(false);
      setError(null);
      reset();
      refetch();
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  const handleFilterChange = () => {
    setIsRefetching(true);
    refetch();
    setTimeout(() => {
      setIsRefetching(false);
    }, 500);
  };

  return (
    <Layout>
      <LayoutTitle title="Manage Users" />

      <div className="px-5 sm:px-10 py-5">
        <button
          className="btn my-5 flex gap-2 w-full sm:w-auto justify-center"
          onClick={() => setAddUserShow(true)}
        >
          <Plus /> Add User
        </button>
        <div className="table-filter mt-2">
          <div className="flex flex-row gap-5">
            <input
              type="text"
              className="input w-1/2"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                handleFilterChange();
              }}
            />
            <input
              type="text"
              className="input w-1/2"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                handleFilterChange();
              }}
            />
          </div>
          <div className="flex flex-row gap-5">
            <input
              type="text"
              className="input w-1/2"
              placeholder="Username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                handleFilterChange();
              }}
            />
            <select
              name=""
              id=""
              className="input w-1/2"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                handleFilterChange();
              }}
            >
              <option value="">All</option>
              <option value="user">User</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
            <select
              name=""
              id=""
              className="input w-1/2"
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
          </div>
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
        <UsersTable
          data={data?.data.filter((user) => user.id !== authenticatedUser.id)}
          isLoading={isLoading}
        />
      </div>

      {/* Add User Modal */}
      <Modal show={addUserShow}>
        <div className="flex">
          <h1 className="font-semibold mb-3">Add User</h1>
          <button
            className="ml-auto focus:outline-none"
            onClick={() => {
              reset();
              setError(null);
              setAddUserShow(false);
            }}
          >
            <X size={30} />
          </button>
        </div>
        <hr />

        <form
          className="flex flex-col gap-5 mt-5"
          onSubmit={handleSubmit(saveUser)}
        >
          <div className="flex flex-col gap-5 sm:flex-row">
            <input
              type="text"
              className="input sm:w-1/2"
              placeholder="First Name"
              required
              disabled={isSubmitting}
              {...register('firstName')}
            />
            <input
              type="text"
              className="input sm:w-1/2"
              placeholder="Last Name"
              required
              disabled={isSubmitting}
              {...register('lastName')}
            />
          </div>
          <input
            type="text"
            className="input"
            required
            placeholder="Username"
            disabled={isSubmitting}
            {...register('username')}
          />
          <input
            type="password"
            className="input"
            required
            placeholder="Password (min 6 characters)"
            disabled={isSubmitting}
            {...register('password')}
          />
          <select
            className="input"
            required
            {...register('role')}
            disabled={isSubmitting}
          >
            <option value="user">User</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
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
