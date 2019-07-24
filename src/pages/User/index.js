import React, { Component } from 'react';
import PropTypes from 'prop-types';

import api from '../../services/api';
import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
  LoadingIndicator,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    loading: false,
    page: 1,
    refreshing: false,
  };

  async componentDidMount() {
    this.load();
  }

  handleNavigate = repository => {
    const { navigation } = this.props;

    navigation.navigate('Repository', { repository });
  };

  async load(page = 1) {
    const { stars, refreshing } = this.state;
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    if (!refreshing) this.setState({ loading: true });

    const response = await api.get(`/users/${user.login}/starred`, {
      params: { page },
    });

    if (response.data.length === 0) {
      this.setState({ loading: false });
      return;
    }

    this.setState({
      stars: page >= 2 ? [...stars, ...response.data] : response.data,
      page,
      loading: false,
      refreshing: false,
    });
  }

  loadMore() {
    const { page } = this.state;
    const nextPage = +page + 1;
    this.load(nextPage);
  }

  async refreshList() {
    await this.setState({ refreshing: true });

    this.load();
  }

  render() {
    const { navigation } = this.props;
    const { stars, loading, refreshing } = this.state;
    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>
        {loading && <LoadingIndicator />}
        <Stars
          onRefresh={() => this.refreshList()}
          refreshing={refreshing}
          onEndReachedThreshold={0.2}
          onEndReached={() => this.loadMore()}
          data={stars}
          keyExtractor={star => String(star.id)}
          renderItem={({ item }) => (
            <Starred onPress={() => this.handleNavigate(item)}>
              <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
              <Info>
                <Title>{item.name}</Title>
                <Author>{item.owner.login}</Author>
              </Info>
            </Starred>
          )}
        />
      </Container>
    );
  }
}
