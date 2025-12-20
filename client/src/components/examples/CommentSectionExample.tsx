import { CommentSection, type Comment } from "../CommentSection";

// todo: remove mock functionality
const mockComments: Comment[] = [
  {
    id: "1",
    author: "Sarah M.",
    authorInitials: "SM",
    neighborhood: "Forest Glen",
    content: "This is a great step forward for housing affordability in our area. I hope more initiatives like this follow.",
    timestamp: "2 days ago",
    upvotes: 24,
    isModerator: false,
    replies: [
      {
        id: "1-1",
        author: "John D.",
        authorInitials: "JD",
        neighborhood: "Wheaton",
        content: "I agree! We need more housing options for families.",
        timestamp: "1 day ago",
        upvotes: 8,
      },
    ],
  },
  {
    id: "2",
    author: "Linda K.",
    authorInitials: "LK",
    neighborhood: "Takoma Park",
    content: "I'm glad they're adding bike lanes.",
    timestamp: "4 days ago",
    upvotes: 31,
    isModerator: true,
  },
];

export default function CommentSectionExample() {
  return (
    <div className="max-w-2xl">
      <CommentSection
        comments={mockComments}
        onAddComment={(content) => console.log("New comment:", content)}
        onUpvote={(id) => console.log("Upvoted:", id)}
        isLoggedIn={true}
      />
    </div>
  );
}
