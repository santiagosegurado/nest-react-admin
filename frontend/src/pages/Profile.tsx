import Layout from '../components/layout';
import UpdateProfile from '../components/profile/UpdateProfile';
import LayoutTitle from '../components/shared/LayoutTitle';

const Profile = () => {
  return (
    <Layout>
      <LayoutTitle title="Profile" />
      <div className="px-5 sm:px-10 py-5">
        <UpdateProfile />
      </div>
    </Layout>
  );
};

export default Profile;
