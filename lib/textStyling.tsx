const StyledText = ({ text }: { text: string }) => {
    // Regular expression to match **text** and *text*
    const boldRegex = /\*\*(.*?)\*\*/g;
    const italicRegex = /\*(.*?)\*/g;

    // Split the text by bold and italic patterns
    const parts = text.split(boldRegex);

    // Apply styles to matched patterns
    const styledText = parts.map((part, index) => {
        if (index % 2 === 1) {
            // For bold text, render each character on a new line
            return (
                <div key={index}>
                    {part.split('').map((char, i) => (
                        <span key={i} style={{ fontWeight: 'bold' }}>{char}</span>
                    ))}
                </div>
            );
        } else {
            // Split the part by sentences starting with *
            const sentences = part.split(/\*(?=\s)/);
            // Apply styles to matched sentences
            return sentences.map((sentence, sentenceIndex) => {
                if (sentenceIndex !== 0) {
                    // Add a new line before each sentence starting with *
                    return <p key={sentenceIndex}>{`* ${sentence}`}</p>;
                } else {
                    return <span key={sentenceIndex}>{sentence}</span>;
                }
            });
        }
    });

    return <div>{styledText}</div>;
};
const CaseStyle = (prop: { text: string }) => {

    return (
        <div className="max-w-2xl mx-auto p-4 bg-gray-100 rounded-lg ">
            <StyledText text={prop.text} />
        </div>
    );
};

export default CaseStyle;