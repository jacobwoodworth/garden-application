import React from "react";
import { View, Text } from "react-native";
import Layout from "./layout"; // Import the Layout component

const Profile: React.FC = () => {
  return (
    <Layout>
      <View>
        <Text>This is the Profile Screen</Text>
      </View>
    </Layout>
  );
};

export default Profile;