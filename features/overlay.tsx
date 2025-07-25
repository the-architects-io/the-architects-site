import classNames from "classnames";
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
    </>
  );
};

export default Overlay;
