"use client";

import Link from "next/link";
import { useAuth } from "@/auth/useAuth";
import { Container, Typography, Button, Box, List, ListItem, ListItemText, Paper, CircularProgress } from "@mui/material";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h2" component="h1" gutterBottom>
        Next.js + Supabase Template
      </Typography>
      
      <Box sx={{ my: 4 }}>
        {isAuthenticated ? (
          <Box>
            <Typography variant="h5" gutterBottom>
              Welcome, {user?.displayName || user?.email}!
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button 
                variant="contained" 
                component={Link} 
                href="/dashboard"
              >
                Go to Dashboard
              </Button>
              <Button 
                variant="outlined" 
                component={Link} 
                href="/profile"
              >
                Profile
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography variant="h5" gutterBottom>
              Please sign in to continue
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button 
                variant="contained" 
                component={Link} 
                href="/signin"
              >
                Sign In
              </Button>
              <Button 
                variant="contained" 
                color="success" 
                component={Link} 
                href="/signup"
              >
                Sign Up
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      <Paper sx={{ p: 3, mt: 6 }}>
        <Typography variant="h4" gutterBottom>
          Features
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="🔐 Supabase Authentication (Email/Password, OAuth providers)" />
          </ListItem>
          <ListItem>
            <ListItemText primary="🗄️ PostgreSQL Database with Row Level Security (RLS)" />
          </ListItem>
          <ListItem>
            <ListItemText primary="💾 Supabase Storage for file uploads" />
          </ListItem>
          <ListItem>
            <ListItemText primary="🔄 Real-time subscriptions with Supabase" />
          </ListItem>
          <ListItem>
            <ListItemText primary="⚡ FastAPI backend with Python" />
          </ListItem>
          <ListItem>
            <ListItemText primary="🤖 3-tier Claude Code agentic framework" />
          </ListItem>
          <ListItem>
            <ListItemText primary="📝 TypeScript support with full type safety" />
          </ListItem>
          <ListItem>
            <ListItemText primary="🎨 Material-UI components and theming" />
          </ListItem>
        </List>
      </Paper>
    </Container>
  );
}