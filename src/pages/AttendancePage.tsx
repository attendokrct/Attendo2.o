@@ .. @@
       <div className="flex justify-between items-center mb-6">
         <button
           onClick={() => navigate('/dashboard')}
           className="flex items-center text-primary-600 hover:text-primary-800"
         >
           <ArrowLeft className="h-4 w-4 mr-1" />
           Back to Dashboard
         </button>
         {isSubmitted ? (
           <div className="flex items-center text-warning-600">
             <AlertCircle className="h-5 w-5 mr-2" />
-            <span>Attendance already submitted for today</span>
+            <span>Attendance already submitted for {new Date().toLocaleDateString()}</span>
           </div>
         ) : (
           <button
             onClick={handleSubmit}
             disabled={isLoading || isSubmitted}
             className={`btn ${isSubmitted ? 'bg-gray-300 cursor-not-allowed' : 'btn-primary'} flex items-center`}
           >
             {isLoading ? (
               <span className="flex items-center">
                 <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                 Saving...
               </span>
             ) : (
               <>
                 <Save className="h-4 w-4 mr-2" />
-                Save Attendance
+                Save Attendance for Today
               </>
             )}
           </button>
         )}
       </div>