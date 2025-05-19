
"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserPlus, Users, Trash2, Send } from 'lucide-react'; // Added Send icon
import { Badge } from '@/components/ui/badge';

interface FriendManagementProps {
  onInviteFriend: (friendName: string) => void;
}

export default function FriendManagement({ onInviteFriend }: FriendManagementProps) {
  const [friends, setFriends] = useState<string[]>(['Alice (Simulated)', 'Bob (Simulated)']);
  const [newFriendName, setNewFriendName] = useState('');

  const handleAddFriend = () => {
    if (newFriendName.trim() && !friends.some(f => f.startsWith(newFriendName.trim()))) {
      setFriends([...friends, newFriendName.trim() + " (Simulated)"]);
      setNewFriendName('');
    } else if (newFriendName.trim()) {
      // Friend already exists or input is empty, maybe show a toast later
      console.log("Friend already exists or name is invalid.");
    }
  };

  const handleRemoveFriend = (friendToRemove: string) => {
    setFriends(friends.filter(friend => friend !== friendToRemove));
  };

  return (
    <Card className="w-full shadow-xl rounded-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary flex items-center">
          <Users className="mr-2 h-7 w-7" />
          Friend Zone (Simulated)
        </CardTitle>
        <CardDescription>
          Add friends and invite them to a game. This is a simulated feature.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="text"
            value={newFriendName}
            onChange={(e) => setNewFriendName(e.target.value)}
            placeholder="Enter friend's name to add"
            className="flex-grow"
            aria-label="New friend name"
          />
          <Button onClick={handleAddFriend} aria-label="Add friend" className="w-full sm:w-auto">
            <UserPlus className="mr-2 h-5 w-5" /> Add Friend
          </Button>
        </div>
        
        <div>
          <h4 className="font-semibold text-muted-foreground mb-2">Your Friends:</h4>
          {friends.length > 0 ? (
            <div className="space-y-2 bg-muted/20 p-4 rounded-lg max-h-48 overflow-y-auto">
              {friends.map((friend) => (
                <div key={friend} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/40 transition-colors group">
                  <Badge variant="secondary" className="text-sm">{friend}</Badge>
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-muted-foreground hover:text-primary"
                      onClick={() => onInviteFriend(friend.replace(" (Simulated)", ""))} // Pass friend name without (Simulated)
                      aria-label={`Invite ${friend} to game`}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveFriend(friend)}
                      aria-label={`Remove ${friend}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center text-muted-foreground py-4">
              You haven't added any friends yet. Use the input above to add some!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
