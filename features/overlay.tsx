import classNames from "classnames";
import Spinner from "@/features/UI/spinner";
import ScrollLock from "react-scrolllock";

type Props = {
  onClick?: () => void;
  isVisible: boolean;
};
const Overlay = ({ onClick, isVisible }: Props) => {
  return (
    <>
      <ScrollLock isActive={isVisible}>
        <div
          onClick={onClick}
          className={classNames({
            "fixed top-0 right-0 bottom-0 left-0 transition-all duration-500 ease-in-out bg-opaque bg-black py-6 z-100":
              isVisible,
            "opacity-0 pointer-events-none": !isVisible,
          })}
        />
      </ScrollLock>
      <style>
        {`
          .bg-opaque {
            background-color: rgba(0,0,0,0.6);
          }
          .centered {
            transform: translate(-50%, -50%);

          }
        `}
      </style>
    </>
  );
};

export default Overlay;
