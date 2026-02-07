import mungshallWrite from "@/assets/images/게시글작성.png";

type Props = {
    className?: string;
    alt?: string;
};

export default function MungshallIllustration({
                                                  className,
                                                  alt = "멍쉘",
                                              }: Props) {
    return (
        <img
            src={mungshallWrite}
            alt={alt}
            className={
                className ??
                `
          pointer-events-none
          absolute
          left-[-133px]
          top-[-183px]
          z-10
          hidden md:block
          w-[400px]
          h-auto
          select-none
        `
            }
            draggable={false}
        />
    );
}
