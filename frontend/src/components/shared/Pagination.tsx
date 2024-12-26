import { ArrowLeft, ArrowRight } from 'react-feather';

import { PaginationResponse } from '../../models/shared/PaginationResponse';

interface PaginationProps {
  page: number;
  setPage: (page: number) => void;
  data: PaginationResponse<any>;
  limit: number;
  handleFilterChange: () => void;
}

const Pagination = ({
  data,
  handleFilterChange,
  limit,
  page,
  setPage,
}: PaginationProps) => {
  return (
    <div className="flex justify-center items-center mt-5">
      <button
        className="btn mx-2"
        onClick={() => {
          if (page > 1) {
            setPage(page - 1);
            handleFilterChange();
          }
        }}
        disabled={page === 1}
      >
        <ArrowLeft />
      </button>
      <span className="mx-4 text-lg">
        {page} / {Math.ceil(data?.total / limit)}
      </span>
      <button
        className="btn mx-2"
        onClick={() => {
          setPage(page + 1);
          handleFilterChange();
        }}
        disabled={data && data.data.length < limit}
      >
        <ArrowRight />
      </button>
    </div>
  );
};

export default Pagination;
