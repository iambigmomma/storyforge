import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { AppLayout } from '../components/AppLayout';
import { getAppProps } from '../utils/getAppProps';


export default function Success() {
  return (
    // The outer div is a flex container that centers its children in both x and y axis.
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        {/* <img
          className="w-auto h-12 mx-auto" // Centers the image horizontally
          src={logo} // replace with your success image path
          alt="Success"
        /> */}
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Thank you for your purchase!
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Your tokens have been added successfully.
        </p>
      </div>
    </div>
  )
}

Success.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const props = await getAppProps(ctx);
    return {
      props,
    };
  },
});


