import { Button, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { IoClose } from "../assets/";
import { useEffect, useState } from "react";

export default function MyModal({ openView, setOpenView, imageUrl }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  function close() {
    setOpenView(false);
  }

  useEffect(() => {
    setImageLoaded(false);
  }, [imageUrl]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <Dialog
      open={openView}
      as="div"
      className="z-40 focus:outline-none"
      onClose={close}
    >
      <div
        onClick={close}
        className="fixed inset-0 flex items-center justify-center z-10 w-screen h-full overflow-y-auto bg-black bg-opacity-75"
      >
        <div className="relative">
          <img
            className={`w-full h-auto max-h-[80vh] object-contain rounded-md transition-opacity ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            src={imageUrl}
            alt="Preview"
            onLoad={handleImageLoad}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center text-white text-lg">
              Loading...
            </div>
          )}
          <div
            className="absolute bg-white bg-opacity-30 rounded-md z-50 -top-7 right-1 text-2xl text-red-500 cursor-pointer"
            onClick={close}
          >
            <IoClose />
          </div>
        </div>
      </div>
    </Dialog>
  );
}
