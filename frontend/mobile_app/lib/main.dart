import 'package:flutter/material.dart';
import 'api_service.dart';

void main() {
  runApp(HumanFitApp());
}

class HumanFitApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'HumanFit AI',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: HomeScreen(),
    );
  }
}

class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('HumanFit AI')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Welcome to HumanFit AI!'),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () async {
                final result = await ApiService.ping();
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(result)),
                );
              },
              child: Text('Ping Backend'),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () async {
                final user = await ApiService.createUser(1, "Alice", "alice@example.com");
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(user)),
                );
              },
              child: Text('Create User'),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () async {
                final avatar = await ApiService.createAvatar(1, 1, "mesh.obj", "texture.png");
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(avatar)),
                );
              },
              child: Text('Create Avatar'),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () async {
                final garments = await ApiService.listGarments();
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(garments)),
                );
              },
              child: Text('List Garments'),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () async {
                final garment = await ApiService.createGarment(3, "Jacket", "outerwear", "jacket.obj");
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(garment)),
                );
              },
              child: Text('Create Garment'),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () async {
                final recommendation = await ApiService.recommend(
                  {"user_id": 1, "preferred_category": "top"},
                  ["shirt1", "shirt2", "jeans1", "jacket1"],
                );
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(recommendation)),
                );
              },
              child: Text('Get Recommendation'),
            ),
          ],
        ),
      ),
    );
  }
}
