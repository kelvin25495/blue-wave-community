
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, User, Heart, MessageCircle } from "lucide-react";
import { useState } from "react";

// Mock forum data
const forumPosts = [
  {
    id: 1,
    user: "Sarah J.",
    avatar: "https://i.pravatar.cc/150?img=32",
    date: "2 days ago",
    title: "Welcome to our new youth group members!",
    content: "Hey everyone! Just wanted to welcome all the new members who joined us last Sunday. Feel free to introduce yourselves here!",
    likes: 15,
    comments: 8
  },
  {
    id: 2,
    user: "Michael T.",
    avatar: "https://i.pravatar.cc/150?img=53",
    date: "1 day ago",
    title: "Bible Study Discussion - John 3:16",
    content: "I was thinking about our last Bible study session where we discussed John 3:16. What stood out to you the most about this verse?",
    likes: 12,
    comments: 10
  },
  {
    id: 3,
    user: "Pastor Dave",
    avatar: "https://i.pravatar.cc/150?img=68",
    date: "5 hours ago",
    title: "Summer Camp Details Announced!",
    content: "Exciting news everyone! We've finalized all the details for this summer's camp. Check out the Events section for registration information.",
    likes: 24,
    comments: 6
  }
];

const ForumSection = () => {
  const [showNewPostForm, setShowNewPostForm] = useState(false);

  return (
    <section id="forum" className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">Community Forum</h2>
            <p className="text-gray-600 mt-2">Connect and share with our youth group community</p>
          </div>
          <Button 
            className="bg-youth-blue hover:bg-youth-blue/90"
            onClick={() => setShowNewPostForm(!showNewPostForm)}
          >
            {showNewPostForm ? "Cancel" : "Create Post"}
          </Button>
        </div>

        {showNewPostForm && (
          <Card className="mb-10 border-l-4 border-l-youth-blue animate-slide-in">
            <CardHeader>
              <CardTitle>Create a New Post</CardTitle>
              <CardDescription>Share your thoughts with the community</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input placeholder="Enter your post title" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea placeholder="What would you like to share?" className="min-h-[120px]" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowNewPostForm(false)}>Cancel</Button>
              <Button className="bg-youth-blue hover:bg-youth-blue/90">Post Message</Button>
            </CardFooter>
          </Card>
        )}

        <div className="space-y-6">
          {forumPosts.map((post) => (
            <Card key={post.id} className="card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden">
                      <img src={post.avatar} alt={post.user} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">{post.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <User size={14} /> {post.user} • {post.date}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{post.content}</p>
              </CardContent>
              <CardFooter className="flex justify-between pt-2 text-sm text-gray-600">
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-1 hover:text-youth-blue transition-colors">
                    <Heart size={16} /> {post.likes}
                  </button>
                  <button className="flex items-center gap-1 hover:text-youth-blue transition-colors">
                    <MessageCircle size={16} /> {post.comments} 
                  </button>
                </div>
                <Button variant="ghost" className="text-youth-blue hover:bg-youth-blue/10">Read More</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Button variant="outline" className="text-youth-blue border-youth-blue hover:bg-youth-blue hover:text-white">
            <MessageSquare className="mr-2 h-4 w-4" /> View All Discussions
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ForumSection;
