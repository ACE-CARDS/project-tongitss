<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        
        <title>ACE CARDS</title>
        <link rel="icon" type="image/x-icon" href="/project-tongitss/assets/favicon.ico">

        <link rel="stylesheet" href="style.css">
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    </head>
    <body>
        <!-- <?php include ("../components/includes/navbar.php") ?> -->

        <main>
            <div class="login-section">
                <h1 class="text-2xl font-bold text-center">Log In</h1>
                <form class="login-form max-w-md mx-auto mt-4">
                    <div class="mb-4">
                        <label for="username" class="block text-sm font-medium mb-1">Username</label>
                        <input type="text" id="username" name="username" class="w-full border border-gray-300 rounded p-2" required>
                    </div>
                    <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">Log In</button>
            </div>
        </main>
        
        <?php include ("../components/includes/footer.php") ?>
    </body>
</html>