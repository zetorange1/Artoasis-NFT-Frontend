import { Box } from "@mui/material";
import Container from "@mui/material/Container";
import { lazy, Suspense, useEffect, useMemo } from "react";
import { Route, Switch } from "react-router-dom";
import Loading from "./components/Loading";
import OverlayLoading from "./components/ui/OverlayLoading";
import { useAuthContext } from "./contexts/AuthContext";
import { useContracts } from "./contexts/Web3Context";
import { Header } from "./core/Header";
import { sameAddress } from "./helper/utils";
import useQuery from "./hooks/useQuery";

const Profile = lazy(() => import("./views/Profile"));
const NFT = lazy(() => import("./views/NFT"));
const CreateMedia = lazy(() => import("./views/CreateMedia"));
const Home = lazy(() => import("./views/Home"));
const Explorer = lazy(() => import("./views/Explorer"));
const Validation = lazy(() => import("./views/Validation"));
const Track = lazy(() => import("./views/Track"));
const NotFound = lazy(() => import("./views/NotFound"));
const CreateCollection = lazy(() => import("./views/CreateCollection"));
const Collections = lazy(() => import("./views/Collections"));
const Collection = lazy(() => import("./views/Collection"));

const PageContainer = ({ children }) => (
  <Container maxWidth="xl" style={{ paddingTop: 24, paddingBottom: 24 }}>
    {children}
  </Container>
);

function App() {
  const query = useQuery();
  const { address } = useAuthContext();
  const { web3 } = useContracts();
  const referral = query.get("referral");

  const allowLoad = useMemo(() => web3 || !address, [web3, address]);

  useEffect(() => {
    if (referral && !sameAddress(address, referral)) {
      localStorage.setItem("open-oasis-referral", referral);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Header />

      <OverlayLoading show={!allowLoad} />

      <Box paddingTop="76px">
        <Suspense fallback={<Loading />}>
          <Switch>
            <Route path="/" exact>
              <Home />
            </Route>
            <Route path="/Explorer" exact>
              <Explorer />
            </Route>
            <Route path="/address/:address" exact>
              <PageContainer>{allowLoad && <Profile />}</PageContainer>
            </Route>
            <Route path="/profile" exact>
              <PageContainer>{allowLoad && <Profile />}</PageContainer>
            </Route>
            <Route path="/create" exact>
              <PageContainer>
                <CreateMedia />
              </PageContainer>
            </Route>
            <Route path="/nft/:contract/:tokenId" exact>
              <PageContainer>{allowLoad && <NFT />}</PageContainer>
            </Route>
            <Route path="/validation" exact>
              <PageContainer>
                <Validation />
              </PageContainer>
            </Route>
            <Route path="/track" exact>
              <PageContainer>
                <Track />
              </PageContainer>
            </Route>
            <Route path="/create-collection" exact>
              <PageContainer>{allowLoad && <CreateCollection />}</PageContainer>
            </Route>
            <Route path="/collections" exact>
              <PageContainer>
                <Collections />
              </PageContainer>
            </Route>
            <Route path="/collections/:address" exact>
              {allowLoad && <Collection />}
            </Route>

            <Route path="*" exact>
              <PageContainer>
                <NotFound />
              </PageContainer>
            </Route>
          </Switch>
        </Suspense>
      </Box>
    </>
  );
}

export default App;
