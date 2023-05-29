import classNames from "classnames";
import Image from "next/image";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl?: string;
}

export const Card = ({ className, children, imageUrl }: CardProps) => {
  return (
    <div
      className={classNames([
        className,
        "bg-black rounded-xl shadow-deep border-2 border-red-500 border-opacity-50 cursor-pointer hover:shadow-deep-float hover:scale-[1.02] transition-all duration-300 ease-in-out",
      ])}
    >
      {!!imageUrl && (
        <Image
          src={imageUrl || ""}
          alt=""
          width="400"
          height="400"
          className=" rounded-t-xl"
        />
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
