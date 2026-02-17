import { Handlers, PageProps } from "$fresh/server.ts";
import { addQuestion } from "../../utils/db.ts";

export const handler: Handlers = {
  async POST(req, ctx) {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
        const form = await req.formData();
        const csvFile = form.get("csvFile");
        
        if (csvFile && csvFile instanceof File) {
            const text = await csvFile.text();
            const lines = text.split("\n");
            let count = 0;
            
            // Expected CSV format: category,text,option0,option1,option2,option3,correctIndex
            for (let i = 1; i < lines.length; i++) { // Skip header
                const line = lines[i].trim();
                if (!line) continue;
                
                // fast-csv or similar would be better, but simple split for now
                // Assuming no commas in text for MVP
                const cols = line.split(",");
                if (cols.length < 7) continue;

                const [category, qText, o0, o1, o2, o3, cIdx] = cols;
                
                const question = {
                    id: crypto.randomUUID(),
                    category: category.trim(),
                    text: qText.trim(),
                    options: [o0.trim(), o1.trim(), o2.trim(), o3.trim()],
                    correctIndex: parseInt(cIdx.trim())
                };
                
                await addQuestion(question);
                count++;
            }
            return new Response(`Imported ${count} questions`, { status: 200 });
        }

        // Handle manual form submission
        const category = form.get("category")?.toString();
        const text = form.get("text")?.toString();
        
        if (category && text) {
             const option0 = form.get("option0")?.toString();
             const option1 = form.get("option1")?.toString();
             const option2 = form.get("option2")?.toString();
             const option3 = form.get("option3")?.toString();
             const correctIndex = parseInt(form.get("correctIndex")?.toString() || "0");
             
             if (!option0 || !option1 || !option2 || !option3) return new Response("Missing options", { status: 400 });

              const question = {
                id: crypto.randomUUID(),
                category,
                text,
                options: [option0, option1, option2, option3],
                correctIndex,
              };

              await addQuestion(question);
              return new Response("", { status: 303, headers: { Location: "/admin" } });
        }
    }

    return new Response("Invalid request", { status: 400 });
  },
};

export default function AdminPage() {
  return (
    <div class="min-h-screen bg-gray-900 text-white p-8">
      <div class="max-w-4xl mx-auto space-y-8">
        <h1 class="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          Admin Dashboard
        </h1>

        {/* CSV Upload Section */}
        <div class="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-xl">
             <h2 class="text-xl font-bold mb-4 text-emerald-400">Bulk Upload Questions (CSV)</h2>
             <p class="text-gray-400 text-sm mb-4">
                Format: <code class="bg-gray-700 px-2 py-1 rounded">category,text,option0,option1,option2,option3,correctIndex</code>
             </p>
             <form method="POST" encType="multipart/form-data" class="flex items-center gap-4">
                <input type="file" name="csvFile" accept=".csv" class="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"/>
                <button type="submit" class="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold shadow-lg transition-all">Upload CSV</button>
             </form>
        </div>

        {/* Manual Entry Section */}
        <form method="POST" encType="multipart/form-data" class="space-y-6 bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-xl">
          <h2 class="text-xl font-bold mb-4 text-blue-400">Add Single Question</h2>
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">Category</label>
            <select name="category" class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="upsc">UPSC</option>
              <option value="ssc">SSC</option>
              <option value="hptat">HPTAT</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">Question Text</label>
            <textarea name="text" rows={3} class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none" required placeholder="Enter the question here..."></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
             {[0, 1, 2, 3].map((i) => (
                <div>
                   <label class="block text-sm font-medium text-gray-400 mb-2">Option {i + 1}</label>
                   <input type="text" name={`option${i}`} class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
             ))}
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">Correct Option</label>
            <select name="correctIndex" class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="0">Option 1</option>
              <option value="1">Option 2</option>
              <option value="2">Option 3</option>
              <option value="3">Option 4</option>
            </select>
          </div>

          <button type="submit" class="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold shadow-lg shadow-blue-500/20 transition-all">
            Add Question
          </button>
        </form>
        
        <div class="mt-8 text-center">
            <a href="/" class="text-gray-400 hover:text-white transition-colors">Back to Home</a>
        </div>
      </div>
    </div>
  );
}
