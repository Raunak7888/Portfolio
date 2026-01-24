import Image from "next/image";

const MessageImage = () => {
    return (
        <Image
            src="/MessageImage.png"
            width={400}
            height={400}
            alt="Contact Message"
            className="rounded-4xl"
        />
    );
};

export default MessageImage;
