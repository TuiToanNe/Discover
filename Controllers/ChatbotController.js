const OpenAI = require("openai");
const ChatLog = require("../models/ChatLog");
const dotenv = require("dotenv");
dotenv.config();
const openai = new OpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama",
});

const ChatbotController = {
  async generateResponse(req, res) {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({
          type: "error",
          message: "Message is required",
        });
      }
      const system_message = `Bạn là một trợ lí Tiếng Việt về du lịch tại Đà Nẵng, Việt Nam.
                              Nếu câu hỏi không liên quan đến chủ đề du lịch, hãy trả lời: Xin lỗi, tôi không thể trả lời câu hỏi này. Với một câu hỏi về du lịch tại thành phố Đà Nẵng, Việt Nam, nêu lời khuyên, địa điểm hoặc đánh giá, một số thông tin và chỉ liệt kê 5 ghi chú đầu tiên, nếu có thể.;
                          Nếu câu hỏi mang tính chung chung, hãy trả lời: "Tôi là trợ lý về du lịch. Bạn có thể hỏi tôi về địa điểm, lời khuyên, hoặc các tip ý du lịch tại Việt Nam."`;
      const prompt = `<s>[INST] <<SYS>>\n${system_message}\n<</SYS>>\n\n${message}[/INST]`;
      const completion = await openai.chat.completions.create({
        model: "vistral",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: true,
      });
      res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8",
      });
      let response = "";
      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content;
        console.log(content)
        if (content) {
          response += content;
          res.write(content);
        }
      }
      res.end();

      await ChatLog.create({
        userId: req.user.id,
        question: message,
        answer: response,
      });
    } catch (error) {
      console.error("Chatbot error:", error);
      res.status(500).json({
        type: "error",
        message: "An error occurred while processing your request",
        error: error.message,
      });
    }
  },
};

module.exports = ChatbotController;
