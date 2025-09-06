---
title: Homework 1
author: Gabriel Brock
date: 2025-09-04
tags:
  - cs1060
  - met_museum
  - groq_llama_3
  - supabase
---

- **GitHub repository URL:** [https://github.com/gabebrock/CS1060--hw1]()
- **Lovable URL:** [https://lovable.dev/projects/d95dbefc-9864-4835-aec3-0a45f8d92a83]()
- **Netlify development URL:** [https://aicuratormet.netlify.apphttps://aicuratormet.netlify.app]()

**Work share:** 100% (Worked alone)
**Issues encountered:**

1. While implementing the chatbot, I continously ran into conversation errors, "Sorry, I'm having trouble processing your question right now." I checked the Supabase logs and saw that I was producing 429 errors (exceeding API quota). 
   1. I checked my Supabase integration to ensure my API key was valid because my OpenAI dashboard was not indicating any usage. I switched the edge function to call a cheaper model and ran into the same issue. 
   2. Forums led me to realize that I could not make API calls on the free tier without adding credits so I switched to another LLM (Grok, `llama-3.3-70b-versatile`) Issue Resolved. 
   
**Hours of work:** 4.5

To view the project locally, clone the repo, insall the necessary dependencies `npm i`, and start the development server `npm run dev`
