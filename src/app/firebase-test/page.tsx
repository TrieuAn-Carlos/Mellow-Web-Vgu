import FirebaseConnectionTest from "@/components/FirebaseConnectionTest";
import TaskMonitoringExample from "@/components/TaskMonitoringExample";

export default function FirebaseTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Firebase Connection Test
          </h1>
          <p className="text-gray-600">
            Test your Firebase Firestore connection and verify the setup is
            working correctly.
          </p>
        </div>

        <FirebaseConnectionTest />

        <div className="mt-12">
          <TaskMonitoringExample />
        </div>

        <div className="mt-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Available Firebase Operations
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Task Monitoring
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>
                  • <code>testFirestoreConnection()</code> - Test database
                  connection
                </li>
                <li>
                  • <code>findCurrentInProgressTask()</code> - Find active tasks
                </li>
                <li>
                  • <code>monitorCurrentInProgressTask()</code> - Real-time
                  monitoring
                </li>
                <li>
                  • <code>startTaskMonitoring()</code> - Start monitoring with
                  initial load
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Statistics & Analytics
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>
                  • <code>getTotalMellowsInTimeframe()</code> - Get completed
                  tasks count
                </li>
                <li>
                  • <code>getTotalFocusTime()</code> - Calculate total focus
                  time
                </li>
                <li>
                  • <code>getAverageDuration()</code> - Get average task
                  duration
                </li>
                <li>
                  • <code>getTimeDistributionByProject()</code> - Project time
                  analysis
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">
              Firebase Configuration Details
            </h4>
            <div className="text-sm text-blue-700 grid md:grid-cols-2 gap-2">
              <p>
                <strong>Project ID:</strong> mellow-4401e
              </p>
              <p>
                <strong>Auth Domain:</strong> mellow-4401e.firebaseapp.com
              </p>
              <p>
                <strong>Storage Bucket:</strong>{" "}
                mellow-4401e.firebasestorage.app
              </p>
              <p>
                <strong>App ID:</strong>{" "}
                1:576872483862:web:0c65f304249bb5fa797937
              </p>
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Next Steps</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>1. Test the Firebase connection using the button above</li>
              <li>
                2. Import functions from <code>@/lib/firebase-monitoring</code>{" "}
                in your components
              </li>
              <li>
                3. Use the task monitoring functions for real-time updates
              </li>
              <li>4. Implement the statistics functions in your stats page</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
