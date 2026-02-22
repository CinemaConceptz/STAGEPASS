import os
from emergentintegrations.llm.chat import LlmChat, UserMessage
from dotenv import load_dotenv

load_dotenv()

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("EMERGENT_LLM_KEY")
        if not self.api_key:
            print("Warning: EMERGENT_LLM_KEY not found in environment")
        
    async def chat(self, message: str, history: list = []):
        try:
            # Initialize chat with Gemini
            chat = LlmChat(
                api_key=self.api_key,
                session_id="stagepass-session",
                system_message="""You are the STAGEPASS AI Butler. 
                You are a sophisticated, helpful, and slightly witty assistant for a premium creator platform.
                Your goal is to help creators upload content, manage their schedule, and fix issues.
                Keep responses concise and helpful. 
                Tone: Professional, Tech-savvy, "Electric".
                """
            ).with_model("gemini", "gemini-3-flash-preview")

            # Create user message
            user_msg = UserMessage(text=message)
            
            # Send message
            response = await chat.send_message(user_msg)
            
            # Handle response type
            if hasattr(response, 'text'):
                return response.text
            elif isinstance(response, str):
                return response
            else:
                return str(response)
            
        except Exception as e:
            print(f"Gemini Error: {str(e)}")
            return "I apologize, but I'm having trouble connecting to the neural network right now. Please try again later."
