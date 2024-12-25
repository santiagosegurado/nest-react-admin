import { RefreshCw } from 'react-feather';

interface RefreshButtonProps {
  isRefetching: boolean;
  handleFilterChange: () => void;
}
const RefreshButton = ({
  handleFilterChange,
  isRefetching,
}: RefreshButtonProps) => {
  return (
    <RefreshCw
      className={`text-brandPrimary cursor-pointer ${
        isRefetching && 'animate-spin'
      }`}
      onClick={handleFilterChange}
    />
  );
};

export default RefreshButton;
