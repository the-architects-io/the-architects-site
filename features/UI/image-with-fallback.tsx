import { PhotoIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import Image from "next/image";

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  className?: string;
}

export const ImageWithFallback = ({ src, alt, className, ...props }: Props) => {
  return (
    <>
      {!!src ? (
        <Image
          className={classNames(["rounded-2xl", className])}
          src={src || ""}
          width={(props.width && Number(props.width)) || 60}
          height={(props.height && Number(props.height)) || 60}
          alt={alt}
        />
      ) : (
        <div className="flex justify-center ">
          <PhotoIcon
            className={classNames([
              "h-12 w-12 text-stone-500",
              props.width && props.width > 100 && "h-24 w-24",
            ])}
          />
        </div>
      )}
    </>
  );
};
